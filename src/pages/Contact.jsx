import { Mail } from 'lucide-react';
import './Contact.css';

export default function Contact() {
    return (
        <div className="contact-page">
            <div className="contact-header">
                <h1>Contact Support</h1>
                <p>Have an issue, feedback, or a partnership inquiry? We'd love to hear from you.</p>
            </div>

            <div className="contact-container single-panel">
                <div className="contact-info-panel centered-panel">
                    <div className="info-blob blob-1"></div>
                    <div className="info-blob blob-2"></div>

                    <div className="info-content text-center">
                        <h2>Get in Touch</h2>
                        <p>Have questions about SecuritySim? Reach out to us directly via email.</p>

                        <div className="direct-contact center-contact">
                            <div className="direct-item">
                                <div className="direct-icon">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4>Email Us Directly</h4>
                                    <a href="mailto:info@hari07.tech" className="email-link">info@hari07.tech</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
