import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../components/Notifications';
import api from '../services/api';

function CompanyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchCompany();
        // eslint-disable-next-line
    }, [id]);

    const fetchCompany = async () => {
        try {
            const response = await api.get(`/companies/${id}`);
            setCompany(response.data);
            setFormData({
                name: response.data.name || '',
                industry: response.data.industry || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
                address: response.data.address || '',
            });
        } catch (error) {
            console.error('Error loading company:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
        if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) errors.phone = 'Invalid phone format';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        try {
            const response = await api.put(`/companies/${id}`, formData);
            setCompany(response.data);
            setEditing(false);
            setFormErrors({});
            setNotification({ message: 'Company updated successfully!', type: 'success' });
        } catch {
            setNotification({ message: 'Error updating company', type: 'error' });
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this company?')) {
            try {
                await api.delete(`/companies/${id}`);
                navigate('/companies');
            } catch {
                setNotification({ message: 'Error deleting company', type: 'error' });
            }
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading...</div>;
    }

    if (!company) {
        return <div className="p-6 text-center text-gray-500">Company not found.</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <button
                onClick={() => navigate('/companies')}
                className="text-slate-500 hover:text-slate-700 text-sm mb-4 flex items-center gap-1 transition-colors"
            >
                ← Back to Companies
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">{company.name}</h1>
                    <div className="flex gap-2">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => { setEditing(false); setFormErrors({}); setFormData({ name: company.name || '', industry: company.industry || '', email: company.email || '', phone: company.phone || '', address: company.address || '' }); }}
                                    className="border border-slate-300 text-slate-600 px-4 py-1.5 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                                >
                                    Edit
                                </button>
                                {user?.role === 'admin' && (
                                <button
                                    onClick={handleDelete}
                                    className="border border-red-300 text-red-600 px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 transition-colors"
                                >
                                    Delete
                                </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {[
                        { label: 'Name', name: 'name', value: company.name, required: true },
                        { label: 'Industry', name: 'industry', value: company.industry },
                        { label: 'Email', name: 'email', value: company.email },
                        { label: 'Phone', name: 'phone', value: company.phone },
                        { label: 'Address', name: 'address', value: company.address },
                    ].map(({ label, name, value, required }) => (
                        <div key={name} className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-slate-50">
                            <span className="text-sm font-medium text-slate-400 sm:w-32 mb-1 sm:mb-0">
                                {label} {required && editing && <span className="text-red-400">*</span>}
                            </span>
                            {editing ? (
                                <div className="flex-1">
                                    <input
                                        type={name === 'email' ? 'email' : 'text'}
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none ${
                                            formErrors[name] ? 'border-red-500' : 'border-slate-200 focus:border-slate-400'
                                        }`}
                                    />
                                    {formErrors[name] && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>
                                    )}
                                </div>
                            ) : (
                                <span className="text-slate-800">{value || '—'}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CompanyDetail;