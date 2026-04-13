import React from 'react';
import { createRoot } from 'react-dom/client';
import Options from '../../src/components/Options';

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);