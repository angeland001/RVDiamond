import { useEffect, useState } from 'react';
import { SITE } from '../config/site';

// Builds the address after mount so it never appears as a plain "user@domain"
// string in the bundle or initial markup — keeps simple email harvesters off it.
export default function EmailLink() {
  const [address, setAddress] = useState('');

  useEffect(() => {
    setAddress(`${SITE.emailUser}@${SITE.emailDomain}`);
  }, []);

  if (!address) return <span>{SITE.emailUser} [at] {SITE.emailDomain}</span>;
  return <a href={`mailto:${address}`}>{address}</a>;
}
