import React, { useState, useRef } from 'react';
import './SRTRenamer.css';
import { Analytics } from "@vercel/analytics/react"

export default function SRTRenamer() {
  const [files, setFiles] = useState([]);
  const [fileCount, setFileCount] = useState('No files dropped yet.');
  const [firstPart, setFirstPart] = useState('');
  const [increment, setIncrement] = useState('');
  const [lastPart, setLastPart] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const dropAreaRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.name.endsWith('.srt')
    );

    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setFileCount(`${droppedFiles.length} SRT file(s) ready for renaming.`);
    } else {
      setFileCount('No valid SRT files dropped.');
    }
  };

  const handleRename = () => {
    if (files.length === 0) {
      alert('Please drop some SRT files first.');
      return;
    }

    files.forEach((file, index) => {
      const incrementMatch = increment.match(/S(\d+)E(\d+)/);
      if (!incrementMatch) {
        alert('Increment format must be like S02E01');
        return;
      }

      const seasonNumber = incrementMatch[1];
      const startingEpisode = parseInt(incrementMatch[2], 10);
      const currentEpisode = String(startingEpisode + index).padStart(2, '0');

      const seasonEpisode = `S${seasonNumber}E${currentEpisode}`;
      const newFileName = `${firstPart}${seasonEpisode}${lastPart}.srt`;

      const reader = new FileReader();

      reader.onload = (e) => {
        const fileContent = e.target.result;
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = newFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      reader.readAsText(file);
    });
  };

  return (
    <div
      className={`container ${isDragging ? 'dragging' : ''}`}
      ref={dropAreaRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h1>Drop SRT Files Here</h1>
      <input
        type="text"
        placeholder="Enter first part of the file name"
        value={firstPart}
        onChange={(e) => setFirstPart(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter increment for episode and season (e.g., S02E01)"
        value={increment}
        onChange={(e) => setIncrement(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter last part of the file name"
        value={lastPart}
        onChange={(e) => setLastPart(e.target.value)}
      />
      <button onClick={handleRename}>Rename and Download</button>
      <p>{fileCount}</p>
    </div>
  );
}
