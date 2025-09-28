import React, { useState, useEffect } from 'react';

const PatientContext = ({ patientId, onSelectPatient, onPersist }) => {
  const [patient, setPatient] = useState({
    id: patientId || '',
    medical_record_number: '',
    first_name: '',
    last_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // success | error | null
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patientId) {
      setPatient(prevPatient => ({
        ...prevPatient,
        id: patientId
      }));
    }
  }, [patientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedPatient = {
      ...patient,
      [name]: value
    };
    
    setPatient(updatedPatient);
    
    if (onSelectPatient) {
      onSelectPatient(updatedPatient);
    }
  };

  const resetPatientInfo = () => {
    const resetPatient = {
      id: '',
      medical_record_number: '',
      first_name: '',
      last_name: ''
    };
    
    setPatient(resetPatient);
    
    if (onSelectPatient) {
      onSelectPatient(null);
    }
  };

  const canSave = patient.medical_record_number && patient.first_name && patient.last_name;

  const persistPatient = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      // If we already have an ID assume patient exists; allow update minimal
      const endpoint = patient.id ? `/api/v1/patients/${patient.id}` : '/api/v1/patients';
      const method = patient.id ? 'PUT' : 'POST';
      const body = {
        medical_record_number: patient.medical_record_number,
        first_name: patient.first_name,
        last_name: patient.last_name
      };
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save patient');
      const persisted = data.patient || data; // unify
      setPatient(prev => ({ ...prev, id: persisted.id }));
      setSaveStatus('success');
      if (onSelectPatient) onSelectPatient({ ...patient, id: persisted.id });
      if (onPersist) onPersist(persisted);
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      console.error('Persist patient failed', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Patient Information</h3>
          {saveStatus === 'success' && (
            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-medium">Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 font-medium">Failed</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Patient ID
            </label>
            <input
              type="text"
              name="id"
              className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter patient ID"
              value={patient.id}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Medical Record Number
            </label>
            <input
              type="text"
              name="medical_record_number"
              className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter MRN"
              value={patient.medical_record_number}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter first name"
              value={patient.first_name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter last name"
              value={patient.last_name}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <button
            className="text-xs text-text-secondary hover:text-text-primary"
            onClick={resetPatientInfo}
            type="button"
          >
            Reset
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canSave || saving}
              onClick={persistPatient}
              className={`text-xs px-4 py-2 rounded-md font-medium tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow ${saving ? 'animate-pulse' : 'hover:from-teal-500 hover:to-indigo-500'}`}
            >
              {saving ? 'Saving...' : patient.id ? 'Update Patient' : 'Save Patient'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientContext;