import React, { useState } from "react";
import "./ui.css";
import { useTranslation } from '../i18n';

const Collapsible = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  const { t } = useTranslation();

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
        <button className="btn" onClick={() => setOpen(!open)} style={{ background: 'transparent', padding: 6 }}>{open ? t('hide') || 'Hide' : t('show') || 'Show'}</button>
      </div>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
};

export default Collapsible;
