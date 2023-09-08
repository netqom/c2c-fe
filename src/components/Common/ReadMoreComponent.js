import React, { useState } from 'react';

const ReadMoreComponent = ({ content, maxLength }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleContent = () => {
    setIsExpanded(!isExpanded);
  };

  const displayContent = isExpanded ? content : content.slice(0, maxLength);

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: displayContent }} />
      {content.length > maxLength && (
        <button className='btn btn-primary btn-sm mt-2' onClick={toggleContent}>
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};

export default ReadMoreComponent;
