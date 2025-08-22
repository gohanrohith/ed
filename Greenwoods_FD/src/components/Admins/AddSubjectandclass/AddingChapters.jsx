import React from 'react';

const AddingChapters = ({ data }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Add Chapters to Subjects</h2>
      <div style={styles.classInfo}>
        {data.map((item) => (
          <div key={item._id} style={styles.classCard}>
            <h3 style={styles.className}>Class: {item.class}</h3>
            <h4 style={styles.subjectName}>Subject: {item.subject}</h4>
            <p style={styles.subjectId}>ID: {item._id}</p>
            {/* You can add a form to create chapters here */}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
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
  classInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  classCard: {
    padding: '1rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  className: {
    fontSize: '1.2rem',
    color: '#2c3e50',
    fontWeight: '600',
  },
  subjectName: {
    fontSize: '1rem',
    color: '#4a5568',
    fontWeight: '500',
  },
  subjectId: {
    fontSize: '0.9rem',
    color: '#4a5568',
  },
};

export default AddingChapters;
