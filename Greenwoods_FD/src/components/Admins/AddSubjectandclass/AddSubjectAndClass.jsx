import React, { useState } from 'react';
import AddingChapters from './AddingChapters'; // Import the AddingChapters component

const AddSubjectAndClass = () => {
  const [classInput, setClassInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [responseData, setResponseData] = useState(null); // To store the response data

  const handleClassChange = (e) => {
    setClassInput(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSubjectInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const subjectsArray = subjectInput.split(',')
      .map(subject => subject.trim())
      .filter(Boolean);

    const data = {
      class: classInput.trim(),
      subjects: subjectsArray
    };

    try {
      const response = await fetch('http://localhost:5000/api/classSubjects/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Class and subjects added successfully');
        setResponseData(responseData.data); // Store the response data to pass to AddingChapters
        setClassInput('');
        setSubjectInput('');
      } else {
        console.error('Failed to add class and subjects');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Add Class with Subjects</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="class" style={styles.label}>Class Name:</label>
          <input
            type="text"
            id="class"
            value={classInput}
            onChange={handleClassChange}
            placeholder="Enter class name (e.g., Class 1A)"
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="subject" style={styles.label}>Subjects:</label>
          <input
            type="text"
            id="subject"
            value={subjectInput}
            onChange={handleSubjectChange}
            placeholder="Enter comma-separated subjects (e.g., Math, Science, History)"
            style={styles.input}
            required
          />
        </div>
        <button type="submit" style={styles.button}>Create Class</button>
      </form>

      {/* Conditionally render the AddingChapters component if responseData exists */}
      {responseData && <AddingChapters data={responseData} />}
    </div>
  );
};

// Keep the same styles as previous CSS version
const styles = {
  container: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    color: '#2c3e50',
    fontSize: '1.8rem',
    marginBottom: '1.5rem',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.95rem',
    color: '#4a5568',
    fontWeight: '500',
  },
  input: {
    padding: '0.8rem',
    border: '1px solid ',
    backgroundColor:'#e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  button: {
    backgroundColor: '#4299e1',
    color: 'white',
    padding: '0.8rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#3182ce',
      transform: 'translateY(-1px)',
    },
  },
};

export default AddSubjectAndClass;