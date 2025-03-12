"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";

const UserFlow = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userStatus, setUserStatus] = useState("notStarted");

    useEffect(() => {
        const fetchUserStatus = async () => {
            const status = await getUserStatus();
            if (typeof status === 'string') {
                setUserStatus(status);
            } else {
                console.error("Invalid status:", status);
            }
        };
    
        fetchUserStatus();
    }, []);
    

    useEffect(() => {
        if (userStatus === "enterPhone" || userStatus === "pending") {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [userStatus]);

    const handleModalClose = () => {
        setIsOpen(false);
    };

    return (
        <div>
            <h1>User Flow</h1>
            <Modal
                title="Verify Your Account"
                description="Please complete the verification process."
                isOpen={isOpen}
                onClose={handleModalClose}
            >
                <p>Content of the modal goes here...</p>
            </Modal>
        </div>
    );
};

export default UserFlow;

async function getUserStatus() {
    return new Promise((resolve) => {
        setTimeout(() => resolve("enterPhone"), 1000);
    });
}
