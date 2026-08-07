import Card from '../ui/Card'

const shortcutRows = [
  ['Ctrl/Cmd + N', 'Focus the add bet form'],
  ['Ctrl/Cmd + F', 'Focus the search field'],
  ['Esc', 'Close dialogs and return from help'],
  ['?', 'Open the shortcuts help view'],
]

const guideSections = [
  {
    title: 'Getting Started',
    points: [
      'Add bets with the Add Bet form to begin tracking your portfolio.',
      'Use the search and filter panels to narrow records by event, sport, or settlement status.',
      'Review the analytics cards and charts to understand profit, ROI, and win rate trends.',
    ],
  },
  {
    title: 'Import / Export',
    points: [
      'Use Export Bets to download a timestamped JSON file containing all current records.',
      'Use Import Bets to restore data from a previously exported file.',
      'Imported data is validated before it replaces the current dataset.',
    ],
  },
  {
    title: 'Backup & Restore',
    points: [
      'Create a backup any time from the Data Management panel.',
      'Each backup includes a timestamp and saved bet count.',
      'Use Restore to instantly bring a previous snapshot back into the dashboard.',
    ],
  },
  {
    title: 'Analytics',
    points: [
      'Profit is calculated from the current filtered data set, not the full raw list.',
      'Stats adapt as you search, filter, and update bets in real time.',
      'Use the sport and result filters to isolate the exact segment you want to review.',
    ],
  },
]

const faqs = [
  {
    question: 'Where is my data stored?',
    answer: 'All data is stored in the browser using localStorage so the app remains fully frontend-only.',
  },
  {
    question: 'Does reset delete everything?',
    answer: 'Yes. Clear All Bets removes the current ledger and wipes stored data from localStorage after confirmation.',
  },
  {
    question: 'What happens if my import file is invalid?',
    answer: 'The app shows an error and does not replace the current record set until a valid file is selected.',
  },
]

function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Help</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text)]">Bet Intelligence Guide</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">Getting Started</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {guideSections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4">
              <h3 className="text-base font-semibold text-[var(--text)]">{section.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span aria-hidden="true" className="mt-1 text-indigo-600">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">Keyboard Shortcuts</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--panel-muted)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Shortcut</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {shortcutRows.map(([shortcut, action]) => (
                <tr key={shortcut} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{shortcut}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">FAQ</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4">
              <h3 className="text-base font-semibold text-[var(--text)]">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default HelpPage
