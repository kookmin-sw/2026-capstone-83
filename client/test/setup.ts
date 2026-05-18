import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

// React를 전역으로 사용 가능하게 설정
vi.stubGlobal('React', React);
