import { useState } from 'react';


const CreateDeal = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '', // ROI is stored in price field
    minInvestment: '',
    tenure: '18',
    lockingPeriod: '6',
    payouts: 'Quarterly',
    category: 'General',
    startDate: '',
    endDate: '',
    status: 'active'
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      setMessage({ type: 'error', text: 'Please select an image' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Convert image to base64
      const base64Image = await convertImageToBase64(image);
      
      // Create deal data
      const dealData = {
        ...formData,
        price: formData.price ? Number(formData.price) : undefined, // ROI stored in price field
        minInvestment: formData.minInvestment ? Number(formData.minInvestment) : undefined,
        tenure: formData.tenure ? Number(formData.tenure) : undefined,
        lockingPeriod: Number(formData.lockingPeriod),
        image: base64Image
      };

      // Send to backend
      const response = await api.post('/admin/deals', dealData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Deal created successfully!' });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: '',
          minInvestment: '',
          tenure: '18',
          lockingPeriod: '6',
          payouts: 'Quarterly',
          category: 'General',
          startDate: '',
          endDate: '',
          status: 'active'
        });
        setImage(null);
        setImagePreview(null);
        
        // Clear file input
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create deal' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Create New Deal</h1>
      
      {message.text && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Min Investment *</label>
          <input
            type="number"
            name="minInvestment"
            value={formData.minInvestment}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            placeholder="e.g., 50000"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>ROI (%) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g., 19"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tenure (Months) *</label>
            <input
              type="number"
              name="tenure"
              value={formData.tenure}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="e.g., 18"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Locking Period (Months) *</label>
          <input
            type="number"
            name="lockingPeriod"
            value={formData.lockingPeriod}
            onChange={handleInputChange}
            required
            min="1"
            placeholder="e.g., 6"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Payouts</label>
          <div style={{ 
            width: '100%', 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            backgroundColor: '#f8f9fa',
            color: '#6c757d'
          }}>
            Quarterly (Fixed)
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
              min={formData.startDate}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Image *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
          {imagePreview && (
            <div style={{ marginTop: '10px' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Deal...' : 'Create Deal'}
        </button>
      </form>
    </div>
  );
};

export default CreateDeal;
