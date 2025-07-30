import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import uploadService from '../../services/uploadService';

const DistributionView = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [expandedDistribution, setExpandedDistribution] = useState(null);

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const response = await uploadService.getAllDistributions();
      setDistributions(response.distributions);
    } catch (error) {
      console.error('Error fetching distributions:', error);
      toast.error('Failed to fetch distributions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDistribution = async (distributionId) => {
    if (!window.confirm('Are you sure you want to delete this distribution?')) {
      return;
    }

    try {
      await uploadService.deleteDistribution(distributionId);
      setDistributions(distributions.filter(dist => dist._id !== distributionId));
      toast.success('Distribution deleted successfully!');
    } catch (error) {
      console.error('Error deleting distribution:', error);
      toast.error('Failed to delete distribution');
    }
  };

  const toggleExpanded = (distributionId) => {
    setExpandedDistribution(
      expandedDistribution === distributionId ? null : distributionId
    );
  };

  // Get unique agents for filter
  const uniqueAgents = distributions.reduce((acc, dist) => {
    if (!acc.find(agent => agent.id === dist.agentId)) {
      acc.push({
        id: dist.agentId,
        name: dist.agentName,
        email: dist.agentEmail
      });
    }
    return acc;
  }, []);

  // Filter distributions based on selected agent
  const filteredDistributions = selectedAgent === 'all' 
    ? distributions 
    : distributions.filter(dist => dist.agentId === selectedAgent);

  if (loading) {
    return (
      <div className="loading">
        <h3>Loading distributions...</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Distribution History</h2>
        <div>
          <label htmlFor="agentFilter" className="form-label mr-2">
            Filter by Agent:
          </label>
          <select
            id="agentFilter"
            className="form-control"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            <option value="all">All Agents</option>
            {uniqueAgents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredDistributions.length === 0 ? (
        <div className="card">
          <div className="text-center" style={{ padding: '40px' }}>
            <h4>No distributions found</h4>
            <p>Upload a file to create distributions.</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <strong>Total Distributions: {filteredDistributions.length}</strong>
          </div>
          
          {filteredDistributions.map((distribution) => (
            <div key={distribution._id} className="card mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4>{distribution.agentName}</h4>
                  <p className="mb-1">
                    <strong>Email:</strong> {distribution.agentEmail}
                  </p>
                  <p className="mb-1">
                    <strong>File:</strong> {distribution.fileName}
                  </p>
                  <p className="mb-1">
                    <strong>Items:</strong> {distribution.totalItems}
                  </p>
                  <p className="mb-1">
                    <strong>Upload Date:</strong> {new Date(distribution.uploadDate).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => toggleExpanded(distribution._id)}
                  >
                    {expandedDistribution === distribution._id ? 'Hide Items' : 'View Items'}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteDistribution(distribution._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedDistribution === distribution._id && (
                <div className="mt-3" style={{ borderTop: '1px solid #dee2e6', paddingTop: '15px' }}>
                  <h5>Assigned Items ({distribution.items.length})</h5>
                  {distribution.items.length === 0 ? (
                    <p>No items assigned to this agent.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>First Name</th>
                            <th>Phone</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {distribution.items.map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.firstName}</td>
                              <td>{item.phone}</td>
                              <td>{item.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DistributionView;
