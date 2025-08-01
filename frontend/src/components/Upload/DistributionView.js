import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import uploadService from '../../services/uploadService';
import agentService from '../../services/agentService';
import { useAuth } from '../../context/AuthContext';

const DistributionView = () => {
  const [distributions, setDistributions] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [expandedDistribution, setExpandedDistribution] = useState(null);
  const { user } = useAuth();

  // Filter distributions based on selected agent
  const filteredDistributions = useMemo(() => {
    if (selectedAgent === 'all') {
      return distributions;
    }
    return distributions.filter(dist => String(dist.agentId) === String(selectedAgent));
  }, [distributions, selectedAgent]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch available agents/sub-agents based on user role
        const agentsResponse = await agentService.getAllAgents();
        setAvailableAgents(agentsResponse.agents || []);
        
        // Fetch all distributions (we'll filter them locally)
        const distributionsResponse = await uploadService.getAllDistributions();
        setDistributions(distributionsResponse.distributions || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
        setDistributions([]);
        setAvailableAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Remove selectedAgent dependency since we're filtering locally now

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
            Filter by {user?.role === 'admin' ? 'Agent' : 'Sub-Agent'}:
          </label>
          <select
            id="agentFilter"
            className="form-control"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            <option key="all-agents" value="all">All {user?.role === 'admin' ? 'Agents' : 'Sub-Agents'}</option>
            {availableAgents.map(agent => (
              <option key={`agent-${agent._id}`} value={agent._id}>
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
                            <tr key={`item-${distribution._id}-${index}`}>
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
