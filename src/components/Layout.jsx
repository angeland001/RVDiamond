import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';
import CallBar from './CallBar';
import PageLoader from './PageLoader';

const LOADER_TAGS = {
  '/':         'Warming the truck',
  '/services': 'Loading the toolbox',
  '/coverage': 'Plotting the route',
  '/about':    'Pulling the story',
  '/contact':  'Ringing the shop',
};

export default function Layout() {
  const { pathname } = useLocation();
  const tag = LOADER_TAGS[pathname] ?? 'Loading…';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <>
      <PageLoader tag={tag} />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Nav />
      <main id="main-content" role="main" className="page-enter">
        <Outlet />
      </main>
      <Footer />
      <CallBar />
    </>
  );
}
