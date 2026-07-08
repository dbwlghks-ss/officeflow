import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { MailAccountData } from '../../../lib/mailHubMockData'
import {
  addMailAccount,
  loadMailAccounts,
  markAccountRead,
  removeMailAccount,
  saveMailAccounts,
} from '../../../lib/mailHubStorage'
import AddMailAccountModal from './AddMailAccountModal'
import MailAccountItem from './MailAccountItem'

export default function MailHubPanel() {
  const [accounts, setAccounts] = useState<MailAccountData[]>(() => loadMailAccounts())
  const [modalOpen, setModalOpen] = useState(false)

  function persist(nextAccounts: MailAccountData[]) {
    setAccounts(nextAccounts)
    saveMailAccounts(nextAccounts)
  }

  function handleAddAccount(account: MailAccountData) {
    persist(addMailAccount(accounts, account))
  }

  function handleMarkRead(accountId: string) {
    persist(markAccountRead(accounts, accountId))
  }

  function handleDelete(accountId: string) {
    persist(removeMailAccount(accounts, accountId))
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
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500/90">
          현재는 수동 확인 모드입니다. 계정을 클릭해 웹메일을 확인할 수 있습니다.
        </p>

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto scrollbar-slim">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500/80">
            연결된 계정
          </p>

          {accounts.length === 0 ? (
            <div className="rounded-btn border border-dashed border-white/60 bg-white/40 px-3 py-4 text-center">
              <p className="text-xs font-medium text-slate-700">등록된 메일 계정이 없습니다.</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                메일 계정을 추가하면 이곳에서 한눈에 확인할 수 있습니다.
              </p>
            </div>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {accounts.map((account) => (
                <MailAccountItem
                  key={account.id}
                  account={account}
                  variant="accent"
                  compact
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-2 inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-btn border border-brand/15 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand/30 hover:bg-white"
        >
          <Plus size={15} strokeWidth={1.75} aria-hidden="true" />
          메일 계정 추가
        </button>
      </section>

      <AddMailAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddAccount}
      />
    </>
  )
}
