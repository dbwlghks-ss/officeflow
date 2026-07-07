import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { MailHubData, MailProvider } from '../../../lib/mailHubMockData'
import { getMailHubData } from '../../../lib/mailHubMockData'
import AddMailAccountModal from './AddMailAccountModal'
import MailAccountItem from './MailAccountItem'
import MailPreviewItem from './MailPreviewItem'

const MAX_MAIL_PREVIEWS = 3

type MailHubPanelProps = {
  /** Replace with API-driven mail hub data later. */
  data?: Partial<MailHubData>
}

export default function MailHubPanel({ data }: MailHubPanelProps) {
  const { accounts, previews } = getMailHubData(data)
  const visiblePreviews = previews.slice(0, MAX_MAIL_PREVIEWS)
  const hasMorePreviews = previews.length > MAX_MAIL_PREVIEWS
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<MailProvider | null>(null)

  function openModal() {
    setSelectedProvider(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedProvider(null)
  }

  return (
    <>
      <section aria-label="Mail Hub">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">Mail Hub</h2>
          <p className="mt-0.5 text-xs text-slate-500">여러 메일 계정을 한곳에서 확인하세요.</p>
        </div>

        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            연결된 계정
          </p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {accounts.map((account) => (
              <MailAccountItem key={account.id} account={account} />
            ))}
          </ul>
        </div>

        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            최근 메일
          </p>
          <ul className="m-0 max-h-[240px] list-none overflow-y-auto p-0 scrollbar-slim">
            {visiblePreviews.map((mail) => (
              <MailPreviewItem key={mail.id} mail={mail} />
            ))}
          </ul>
          {hasMorePreviews ? (
            <p className="mt-1.5 text-center text-xs font-medium text-slate-400">
              전체 메일 보기 →
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={openModal}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-btn border border-line bg-surface px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-canvas"
        >
          <Plus size={15} strokeWidth={1.75} aria-hidden="true" />
          메일 계정 추가
        </button>
      </section>

      <AddMailAccountModal
        open={modalOpen}
        selectedProvider={selectedProvider}
        onSelectProvider={setSelectedProvider}
        onClose={closeModal}
      />
    </>
  )
}
