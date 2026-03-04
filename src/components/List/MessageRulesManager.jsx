import React, { useEffect, useState } from "react";
import "./MessageRulesManager.css";

const MessageRulesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    match_value: "",
    success_message: "",
    error_message: "",
    status: 1,
  });

  /* ================= FETCH DATA ================= */

  const fetchMessages = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "https://inoptics.in/api/get_message_rules.php"
      );

      const data = await res.json();

      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    await fetch(
      "https://inoptics.in/api/delete_message_rule.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );

    fetchMessages();
  };

  /* ================= EDIT ================= */

  const handleEdit = (msg) => {
    setEditing(true);

    setFormData({
      id: msg.id,
      match_value: msg.match_value,
      success_message: msg.success_message,
      error_message: msg.error_message,
      status: msg.status,
    });
  };

  /* ================= ADD ================= */

  const openAddForm = () => {
    setAdding(true);

    setFormData({
      match_value: "",
      success_message: "",
      error_message: "",
      status: 1,
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    await fetch(
      "https://inoptics.in/api/create_message_rule.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    setAdding(false);
    fetchMessages();
  };

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async (e) => {
    e.preventDefault();

    await fetch(
      "https://inoptics.in/api/update_message_rule.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    setEditing(false);
    fetchMessages();
  };

  /* ================= UI ================= */

  return (
    <div className="message-manager">
      <div className="header">
        <h2>Message Rules</h2>

        <button className="add-btn" onClick={openAddForm}>
          + Add Message
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Match Value</th>
            <th>Success Message</th>
            <th>Error Message</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {messages.map((msg) => (
            <tr key={msg.id}>
              <td>{msg.id}</td>
              <td>{msg.match_value}</td>
              <td>{msg.success_message}</td>
              <td>{msg.error_message}</td>

              <td>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(msg)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(msg.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= ADD FORM ================= */}

      {adding && (
        <div className="edit-modal">
          <form onSubmit={handleAdd} className="edit-form">
            <h3>Add Message</h3>

            <input
              type="text"
              name="match_value"
              value={formData.match_value}
              onChange={handleChange}
              placeholder="Match Value"
              required
            />

            <textarea
              name="success_message"
              value={formData.success_message}
              onChange={handleChange}
              placeholder="Success Message"
              required
            />

            <textarea
              name="error_message"
              value={formData.error_message}
              onChange={handleChange}
              placeholder="Error Message"
              required
            />

            <div className="form-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>

              <button type="submit" className="update-btn">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= EDIT FORM ================= */}

      {editing && (
        <div className="edit-modal">
          <form onSubmit={handleUpdate} className="edit-form">
            <h3>Edit Message</h3>

            <input
              type="text"
              name="match_value"
              value={formData.match_value}
              onChange={handleChange}
            />

            <textarea
              name="success_message"
              value={formData.success_message}
              onChange={handleChange}
            />

            <textarea
              name="error_message"
              value={formData.error_message}
              onChange={handleChange}
            />

            <div className="form-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>

              <button type="submit" className="update-btn">
                Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MessageRulesManager;