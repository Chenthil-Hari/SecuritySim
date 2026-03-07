import React, { useState, useEffect } from 'react';
import { Radio, AlertCircle, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import './NewsFeed.css';

export default function NewsFeed() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(buildApiUrl('/api/auth/system-status'));
                if (res.ok) {
                    const data = await res.json();
                    setNews(data.news || []);
                }
            } catch (err) {
                console.error("Failed to fetch news feed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'emergency': return <AlertCircle className="news-icon emergency" size={18} />;
            case 'warning': return <AlertCircle className="news-icon warning" size={18} />;
            case 'success': return <CheckCircle2 className="news-icon success" size={18} />;
            default: return <Info className="news-icon info" size={18} />;
        }
    };

    if (loading) return null;
    if (news.length === 0) return null;

    return (
        <div className="news-feed-container">
            <div className="news-feed-header">
                <Radio size={16} className="pulse-icon" />
                <span>INTELLIGENCE FEED</span>
            </div>
            <div className="news-items-container">
                {news.map((item) => (
                    <div key={item._id} className={`news-feed-item ${item.type}`}>
                        <div className="news-item-content">
                            <div className="news-item-top">
                                {getIcon(item.type)}
                                <span className="news-item-title">{item.title}</span>
                                <span className="news-item-time">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="news-item-msg">{item.message}</p>
                        </div>
                        <ChevronRight size={14} className="news-item-arrow" />
                    </div>
                ))}
            </div>
        </div>
    );
}
