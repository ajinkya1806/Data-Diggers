import React, { useState } from 'react';
import axios from 'axios';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [updateResponse, setUpdateResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResponse(null);
    setUpdateResponse(null);
    setSelectedFields([]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setResponse({ error: 'Please select a file to upload.' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    // Optionally add username if not hardcoded in backend
    formData.append('username', 'test_user');

    try {
      console.log('Uploading file:', file.name);
      const res = await axios.post(
        'http://localhost:5000/upload/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setResponse(res.data);
    } catch (error) {
      console.error('Upload error:', error.response);
      setResponse({
        error: error.response?.data?.error || 'An error occurred during upload'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldToggle = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleUpdateFields = async () => {
    if (selectedFields.length === 0) {
      setUpdateResponse({ error: 'Please select at least one field to update.' });
      return;
    }

    setLoading(true);
    const updateData = {
      doc_type: response.new_data.doc_type,
      username: 'test_user', // Match backend default
      fields_to_update: selectedFields.reduce((acc, field) => ({
        ...acc,
        [field]: response.new_data[field]
      }), {})
    };

    try {
      console.log('Updating fields:', updateData);
      const res = await axios.post(
        'http://localhost:5000/upload/update_fields',
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setUpdateResponse(res.data);
    } catch (error) {
      console.error('Update error:', error.response);
      setUpdateResponse({
        error: error.response?.data?.error || 'An error occurred during update'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderComparison = () => {
    if (!response?.existing_data || !response?.new_data) return null;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
        <div style={{ width: '45%', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Existing Data</h3>
          {Object.entries(response.existing_data).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
        </div>
        <div style={{ width: '45%', padding: '10px', border: '1px solid #ccc' }}>
          <h3>New Data (Click to Select)</h3>
          {Object.entries(response.new_data).map(([key, value]) => (
            response.fields_to_update.includes(key) ? (
              <p
                key={key}
                onClick={() => handleFieldToggle(key)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedFields.includes(key) ? '#e0e0e0' : 'transparent',
                  padding: '5px',
                  borderRadius: '3px',
                  margin: '2px 0'
                }}
              >
                <strong>{key}:</strong> {value}
              </p>
            ) : (
              <p key={key}>
                <strong>{key}:</strong> {value}
              </p>
            )
          ))}
        </div>
      </div>
    );
  };

  const renderSimpleResponse = () => {
    if (!response || response.existing_data) return null;

    return (
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        {response.message && (
          <p>
            <strong>Message:</strong> {response.message}
          </p>
        )}
        {response.data && (
          <div>
            <h3>Extracted Data:</h3>
            {Object.entries(response.data).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {value}
              </p>
            ))}
          </div>
        )}
        {response.error && (
          <p style={{ color: 'red' }}>
            <strong>Error:</strong> {response.error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Upload Document</h2>
      <form
        onSubmit={handleUpload}
        style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
      >
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={handleFileChange}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          disabled={!file || loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !file ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {response?.existing_data && renderComparison()}
      {renderSimpleResponse()}

      {response?.existing_data && selectedFields.length > 0 && (
        <button
          onClick={handleUpdateFields}
          disabled={loading}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Updating...' : 'Update Selected Fields'}
        </button>
      )}

      {updateResponse && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Update Response</h3>
          {updateResponse.message && (
            <p>
              <strong>Message:</strong> {updateResponse.message}
            </p>
          )}
          {updateResponse.data && (
            <div>
              <h4>Updated Data:</h4>
              {Object.entries(updateResponse.data).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value}
                </p>
              ))}
            </div>
          )}
          {updateResponse.error && (
            <p style={{ color: 'red' }}>
              <strong>Error:</strong> {updateResponse.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadPage;