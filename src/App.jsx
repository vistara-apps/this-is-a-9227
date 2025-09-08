import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import Header from './components/Header'
import SidebarNav from './components/SidebarNav'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import FindSamples from './pages/FindSamples'
import MyClearances from './pages/MyClearances'
import RightsHolders from './pages/RightsHolders'
import Settings from './pages/Settings'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <div className="min-h-screen bg-dark-bg text-dark-text">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app/*" element={
              <div className="flex h-screen">
                <SidebarNav 
                  collapsed={sidebarCollapsed} 
                  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
                />
                <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1 overflow-auto p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/find-samples" element={<FindSamples />} />
                      <Route path="/clearances" element={<MyClearances />} />
                      <Route path="/rights-holders" element={<RightsHolders />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </main>
                </div>
              </div>
            } />
          </Routes>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(220, 20%, 12%)',
              color: 'hsl(0, 0%, 95%)',
              border: '1px solid hsl(220, 20%, 18%)',
            },
            success: {
              iconTheme: {
                primary: 'hsl(210, 90%, 50%)',
                secondary: 'hsl(220, 20%, 12%)',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(0, 70%, 50%)',
                secondary: 'hsl(220, 20%, 12%)',
              },
            },
          }}
        />
      </SubscriptionProvider>
    </AuthProvider>
  )
}

export default App
