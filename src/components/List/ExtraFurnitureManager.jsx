import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import "./ExtraFurnitureManager.css";

const ExtraFurnitureManager = () => {

  const [companies,setCompanies] = useState([]);
  const [furniture,setFurniture] = useState([]);
  const [selectedFurniture,setSelectedFurniture] = useState([]);

  const [openIndex,setOpenIndex] = useState(null);
  const [search,setSearch] = useState("");
  const [showFurnitureList,setShowFurnitureList] = useState(false);
  const [state,setState] = useState("");

  const [billing,setBilling] = useState({
    amount:0,
    cgst:0,
    sgst:0,
    igst:0,
    grandTotal:0
  });

  /* ================= FETCH COMPANIES ================= */

  const fetchCompanies = async () => {
    try {

      const res = await fetch(
        "https://inoptics.in/api/get_exhibitors.php"
      );

      const data = await res.json();

      const list =
        data.data ||
        data.exhibitors ||
        data.companies ||
        [];

      setCompanies(list);

    } catch (err) {
      console.error("Companies fetch error:", err);
    }
  };

  /* ================= FETCH FURNITURE ================= */

  const fetchFurniture = async () => {
    try {

      const res = await fetch(
        "https://inoptics.in/api/get_furniture_requirement.php"
      );

      const data = await res.json();

      const list =
        data.data ||
        data.furniture ||
        [];

      const normalized = list.map((item)=>({
        id: item.id || Math.random(),
        name: item.furniture_name || item.name,
        image: item.image_url || item.image,
        price: Number(item.price) || 0
      }));

      setFurniture(normalized);

    } catch (err) {
      console.error("Furniture fetch error:", err);
    }
  };

  useEffect(()=>{
    fetchCompanies();
    fetchFurniture();
  },[]);

  /* ================= ACCORDION ================= */

  const toggleAccordion=(index,company)=>{

    setOpenIndex(openIndex===index ? null : index);

    setState(company?.state || "");

  };

  /* ================= ADD FURNITURE ================= */

  const addFurniture=(item)=>{

    const exists = selectedFurniture.find(
      f => f.id === item.id
    );

    if(exists) return;

    setSelectedFurniture([
      ...selectedFurniture,
      {...item,quantity:1}
    ]);

  };

  /* ================= QUANTITY ================= */

  const changeQty=(index,type)=>{

    const updated=[...selectedFurniture];

    if(type==="inc"){
      updated[index].quantity += 1;
    }else{
      updated[index].quantity =
        Math.max(1,updated[index].quantity - 1);
    }

    setSelectedFurniture(updated);

  };

  /* ================= DELETE ================= */

  const deleteFurniture=(index)=>{
    setSelectedFurniture(
      selectedFurniture.filter((_,i)=>i!==index)
    );
  };

  /* ================= BILLING ================= */

  useEffect(()=>{

    let amount = selectedFurniture.reduce(
      (sum,item)=> sum + item.price * item.quantity,
      0
    );

    let cgst=0,sgst=0,igst=0;

    if(state?.toLowerCase() === "delhi"){

      cgst = amount * 0.09;
      sgst = amount * 0.09;

    }else{

      igst = amount * 0.18;

    }

    setBilling({
      amount,
      cgst,
      sgst,
      igst,
      grandTotal: amount + cgst + sgst + igst
    });

  },[selectedFurniture,state]);

  /* ================= FILTER ================= */

  const filteredCompanies = companies.filter(c =>
    c.company_name?.toLowerCase().includes(
      search.toLowerCase()
    )
  );

  return (

    <div className="accordion-container">

      {/* SEARCH */}

      <div className="company-search">

        <input
          placeholder="Search company..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

      </div>

      {/* ACCORDION */}

      {filteredCompanies.map((company,index)=>(

        <div
          key={company.company_name || index}
          className="accordion-item"
        >

          <div
            className="accordion-header"
            onClick={()=>toggleAccordion(index,company)}
          >

            <span>{company.company_name}</span>

            <span>
              {openIndex===index ? "▲" : "▼"}
            </span>

          </div>

          {openIndex===index && (

            <div className="accordion-body">

              {/* ADD BUTTON */}

              <button
                className="add-btn"
                onClick={()=>setShowFurnitureList(true)}
              >
                Add Furniture
              </button>

              {/* TABLE */}

              <table className="furniture-table">

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {selectedFurniture.length===0 && (

                    <tr>
                      <td colSpan="6">
                        No furniture selected
                      </td>
                    </tr>

                  )}

                  {selectedFurniture.map((item,index)=>(

                    <tr key={index}>

                      <td>{index+1}</td>

                      <td>{item.name}</td>

                      <td>₹{item.price}</td>

                      <td className="qty-box">

                        <button
                          onClick={()=>changeQty(index,"dec")}
                        >
                          <FaMinus/>
                        </button>

                        {item.quantity}

                        <button
                          onClick={()=>changeQty(index,"inc")}
                        >
                          <FaPlus/>
                        </button>

                      </td>

                      <td>

                        ₹{(
                          item.quantity * item.price
                        ).toFixed(2)}

                      </td>

                      <td>

                        <button
                          className="delete-btn"
                          onClick={()=>deleteFurniture(index)}
                        >
                          <FaTrash/>
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {/* BILLING */}

              <div className="billing-box">

                <h3>Billing</h3>

                <div className="bill-row">

                  <span>Total</span>

                  <span>
                    ₹{billing.amount.toFixed(2)}
                  </span>

                </div>

                {state?.toLowerCase()==="delhi" ? (

                  <>

                    <div className="bill-row">

                      <span>CGST (9%)</span>

                      <span>
                        ₹{billing.cgst.toFixed(2)}
                      </span>

                    </div>

                    <div className="bill-row">

                      <span>SGST (9%)</span>

                      <span>
                        ₹{billing.sgst.toFixed(2)}
                      </span>

                    </div>

                  </>

                ) : (

                  <div className="bill-row">

                    <span>IGST (18%)</span>

                    <span>
                      ₹{billing.igst.toFixed(2)}
                    </span>

                  </div>

                )}

                <div className="bill-total">

                  ₹{billing.grandTotal.toFixed(2)}

                </div>

                <button className="send-mail-btn">
                  Send Mail
                </button>

              </div>

            </div>

          )}

        </div>

      ))}

      {/* MODAL */}

      {showFurnitureList && (

        <div className="modal">

          <div className="modal-box">

            <h2>Furniture List</h2>

            <div className="furniture-grid">

              {furniture.map(item=>(

                <div
                  key={item.id}
                  className="furniture-card"
                >

                  <img
                    src={`https://www.inoptics.in/api/uploads/${item.image}`}
                    alt=""
                  />

                  <h4>{item.name}</h4>

                  <p>₹{item.price}</p>

                  <button
                    onClick={()=>addFurniture(item)}
                  >
                    Select
                  </button>

                </div>

              ))}

            </div>

            <button
              className="close-btn"
              onClick={()=>setShowFurnitureList(false)}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );

};

export default ExtraFurnitureManager;