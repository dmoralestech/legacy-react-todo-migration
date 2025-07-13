import React from 'react';

export default function AboutPage() {
  return (
    <div className="about-page">
      <h1>About Modern TODO App</h1>
      <div className="about-content">
        <p>
          This TODO application has been migrated from legacy 2018-2019 technology 
          to the latest modern stack:
        </p>
        
        <h2>Modern Technology Stack</h2>
        <ul>
          <li><strong>React 19.1.0</strong> - Latest React with concurrent features</li>
          <li><strong>Next.js 15 canary</strong> - Full-stack React framework with App Router</li>
          <li><strong>Jotai 2.12.5</strong> - Atomic state management</li>
          <li><strong>TanStack Query v5</strong> - Server state management</li>
          <li><strong>TypeScript 5.8.3</strong> - Type-safe development</li>
          <li><strong>Vitest 3.2.4</strong> - Fast unit testing</li>
          <li><strong>Playwright</strong> - End-to-end testing</li>
        </ul>

        <h2>Migration Journey</h2>
        <p>
          Successfully migrated from:
        </p>
        <ul>
          <li><strong>React 16.13.1</strong> → <strong>React 19.1.0</strong></li>
          <li><strong>Create React App</strong> → <strong>Next.js 15</strong></li>
          <li><strong>Redux + Saga</strong> → <strong>Jotai atomic state</strong></li>
          <li><strong>Class Components</strong> → <strong>Modern Function Components</strong></li>
          <li><strong>PropTypes</strong> → <strong>TypeScript</strong></li>
        </ul>
        
        <h2>Features</h2>
        <ul>
          <li>Create, read, update, and delete todos</li>
          <li>Toggle todo completion status</li>
          <li>Filter todos by status (all, active, completed)</li>
          <li>Atomic state management with Jotai</li>
          <li>Server-side rendering with Next.js</li>
          <li>Type-safe development with TypeScript</li>
          <li>Comprehensive test coverage (255+ tests)</li>
        </ul>
        
        <h2>Modern Architecture</h2>
        <p>
          The app now uses atomic state management with Jotai, where each piece 
          of state is an independent atom. This provides better performance, 
          simpler mental model, and excellent TypeScript integration.
        </p>
        
        <p>
          Next.js App Router provides file-system based routing, server-side 
          rendering, and optimized production builds out of the box.
        </p>
      </div>
    </div>
  );
}