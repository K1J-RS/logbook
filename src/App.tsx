import './App.css'
import { LogbookProvider, useLogbookState } from './state/store'
import Header from './components/Header'
import TabBar from './components/TabBar'
import Toast from './components/Toast'
import LogScreen from './components/log/LogScreen'
import HistoryScreen from './components/history/HistoryScreen'
import ProgressScreen from './components/progress/ProgressScreen'
import PlansScreen from './components/plans/PlansScreen'
import LibraryScreen from './components/library/LibraryScreen'
import SummarySplash from './components/summary/SummarySplash'

function Screens() {
  const s = useLogbookState()
  if (!s.loaded) return null
  switch (s.view) {
    case 'log':
      return <LogScreen />
    case 'history':
      return <HistoryScreen />
    case 'progress':
      return <ProgressScreen />
    case 'plans':
      return <PlansScreen />
    case 'library':
      return <LibraryScreen />
    default:
      return null
  }
}

function Shell() {
  const s = useLogbookState()
  return (
    <div className="shell-outer">
      <div className="shell">
        <Header />
        <div className="content">
          <Screens />
        </div>
        <TabBar />
        <Toast />
        {s.summary && <SummarySplash />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LogbookProvider>
      <Shell />
    </LogbookProvider>
  )
}
