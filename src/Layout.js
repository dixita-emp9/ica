import React from 'react';
import { useLocation } from 'react-router-dom';
import Head from './Head'; // Import the Head component
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const location = useLocation();
    const hideHeaderRoutes = ['/home', '/login', '/register'];

    const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname);

    return (
        <>
            {shouldShowHeader && <Head />} {/* Render header only if the path is not in hideHeaderRoutes */}
            <main>
                <Outlet /> {/* This will render the current page's content */}
            </main>
        </>
    );
};

export default Layout;
