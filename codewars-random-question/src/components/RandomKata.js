import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import Select from 'react-select';

const RandomKata = () => {
    const [kata, setKata] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [kataPool, setKataPool] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);

    const languageOptions = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'csharp', label: 'C#' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'php', label: 'PHP' },
        { value: 'swift', label: 'Swift' },
        { value: 'go', label: 'Go' },
    ];

    useEffect(() => {
        const fetchKataPool = async () => {
            try {
                const response = await axios.get('https://www.codewars.com/api/v1/users/jhoffner/code-challenges/completed');
                setKataPool(response.data.data);
            } catch (error) {
                console.error('Error fetching kata pool:', error);
            }
        };
        fetchKataPool();
    }, []);

    const formatDescription = (description) => {
        const cleanHtml = DOMPurify.sanitize(marked(description));
        return cleanHtml;
    };

    const getRandomKata = async () => {
        if (kataPool.length === 0) return;
        
        setLoading(true);
        try {
            let filteredPool = kataPool;
            if (selectedLanguages.length > 0) {
                filteredPool = kataPool.filter(kata => 
                    kata.completedLanguages.some(lang => 
                        selectedLanguages.map(sl => sl.value).includes(lang)
                    )
                );
            }
            
            if (filteredPool.length === 0) {
                alert('No katas found for selected languages. Try different languages.');
                setLoading(false);
                return;
            }

            const randomKata = filteredPool[Math.floor(Math.random() * filteredPool.length)];
            const response = await axios.get(`https://www.codewars.com/api/v1/code-challenges/${randomKata.id}`);
            setKata({
                ...response.data,
                description: formatDescription(response.data.description)
            });
        } catch (error) {
            console.error('Error fetching kata:', error);
        }
        setLoading(false);
    };

    return (
        <>
            <header className="header">
                <h1>Codewars Challenge Generator</h1>
                <p>Level up your coding skills with random challenges</p>
            </header>
            
            <div className="kata-container">
                <div className="language-filter">
                    <Select
                        isMulti
                        options={languageOptions}
                        value={selectedLanguages}
                        onChange={setSelectedLanguages}
                        placeholder="Select languages..."
                        className="language-select"
                    />
                </div>

                <button 
                    onClick={getRandomKata}
                    disabled={loading}
                    className="fetch-button"
                >
                    {loading ? 'Loading...' : 'Get Random Kata'}
                </button>

                {kata && (
                    <div className="kata-details">
                        <div className="kata-grid">
                            <div className="kata-info">
                                <h2>{kata.name}</h2>
                                <p><strong>Difficulty:</strong> {kata.rank?.name}</p>
                                <p><strong>Category:</strong> {kata.category}</p>
                                <p><strong>Languages:</strong> {kata.languages.join(', ')}</p>
                                <p><strong>Total Completed:</strong> {kata.totalCompleted}</p>
                            </div>
                            
                            <div className="kata-description-container">
                                <p><strong>Description:</strong></p>
                                <div 
                                    className={`kata-description ${expanded ? 'expanded' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: kata.description }} 
                                />
                                <button 
                                    className="read-more-btn"
                                    onClick={() => setExpanded(!expanded)}
                                >
                                    {expanded ? 'Show Less' : 'Read More...'}
                                </button>
                            </div>
                        </div>
                        
                        <a 
                            href={kata.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="solve-button"
                        >
                            Solve this kata
                        </a>
                    </div>
                )}
            </div>
        </>
    );
};

export default RandomKata;
