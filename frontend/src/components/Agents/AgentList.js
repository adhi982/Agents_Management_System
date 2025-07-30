import React from 'react';

const AgentList = ({ agents, onEdit, onDelete }) => {
  if (agents.length === 0) {
    return (
      <div className="text-center" style={{ padding: '3rem' }}>
        <h4 style={{ fontSize: '1.25rem', fontWeight: '600' }}>No agents found</h4>
        <p className="text-muted">Create your first agent to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
        All Agents ({agents.length})
      </h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Status</th>
              <th>Created On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent._id}>
                <td>{agent.name}</td>
                <td>{agent.email}</td>
                <td>{agent.mobileNumber}</td>
                <td>
                  <span className={`badge ${agent.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {new Date(agent.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => onEdit(agent)}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(agent._id)}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentList;
