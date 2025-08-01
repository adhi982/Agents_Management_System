import React from 'react';

const AgentList = ({ agents, onEdit, onDelete, onToggleStatus }) => {
  if (agents.length === 0) {
    return (
      <div className="text-center" style={{ padding: '3rem' }}>
        <h4 style={{ fontSize: '1.25rem', fontWeight: '600' }}>No agents found</h4>
        <p className="text-muted">Create your first agent to get started. Only agents you create will be visible here.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
        Your Agents ({agents.length})
      </h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Agent Number</th>
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
                <td>
                  <span className="badge badge-info">
                    {agent.agentNumber || 'N/A'}
                  </span>
                </td>
                <td>{agent.email}</td>
                <td>{agent.mobileNumber}</td>
                <td>
                  <button
                    className={`btn btn-sm ${agent.isActive ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => onToggleStatus(agent._id, !agent.isActive)}
                    style={{ minWidth: '80px' }}
                  >
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  {new Date(agent.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(agent)}
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(agent._id)}
                      style={{ padding: '0.25rem 0.5rem' }}
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
