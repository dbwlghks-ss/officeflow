import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { MailHubData, MailProvider } from '../../../lib/mailHubMockData'
import { getMailHubData } from '../../../lib/mailHubMockData'
import AddMailAccountModal from './AddMailAccountModal'
import MailAccountItem from './MailAccountItem'
import MailPreviewItem from './MailPreviewItem'

const MAX_MAIL_PREVIEWS = 2

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
      <section className="flex h-full min-h-0 flex-col" aria-label="Mail Hub">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand/70">
          Mail Hub
        </p>
        <h2 className="mt-1.5 text-base font-bold leading-snug tracking-tight text-slate-900 lg:text-lg">
          메일을 한곳에서 확인하세요.
        </h2>

        <div className="mt-2 min-h-0 flex-1 overflow-hidden">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500/80">
            연결된 계정
          </p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {accounts.map((account) => (
              <MailAccountItem key={account.id} account={account} variant="accent" compact />
            ))}
          </ul>

          <p className="mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500/80">
            최근 메일
          </p>
          <ul className="m-0 max-h-[72px] list-none overflow-y-auto p-0 scrollbar-slim">
            {visiblePreviews.map((mail) => (
              <MailPreviewItem key={mail.id} mail={mail} variant="accent" compact />
            ))}
          </ul>
          {hasMorePreviews ? (
            <p className="mt-1 text-center text-[11px] font-medium text-slate-500/80">
              전체 메일 보기 →
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={openModal}
          className="mt-2 inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-btn border border-brand/15 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand/30 hover:bg-white"
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
