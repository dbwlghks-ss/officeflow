import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { MailAccountData } from '../../../lib/mailHubMockData'
import {
  addMailAccount,
  loadMailAccounts,
  markAccountRead,
  removeMailAccount,
  saveMailAccounts,
  updateMailAccount,
} from '../../../lib/mailHubStorage'
import AddMailAccountModal from './AddMailAccountModal'
import MailAccountItem from './MailAccountItem'

type ModalState =
  | { open: false }
  | { open: true; mode: 'add' }
  | { open: true; mode: 'edit'; account: MailAccountData }

export default function MailHubPanel() {
  const [accounts, setAccounts] = useState<MailAccountData[]>(() => loadMailAccounts())
  const [modal, setModal] = useState<ModalState>({ open: false })

  function persist(nextAccounts: MailAccountData[]) {
    setAccounts(nextAccounts)
    saveMailAccounts(nextAccounts)
  }

  function handleAddAccount(account: MailAccountData) {
    persist(addMailAccount(accounts, account))
  }

  function handleUpdateAccount(account: MailAccountData) {
    persist(
      updateMailAccount(accounts, account.id, {
        provider: account.provider,
        label: account.label,
        email: account.email,
        webmailUrl: account.webmailUrl,
      }),
    )
  }

  function handleMarkRead(accountId: string) {
    persist(markAccountRead(accounts, accountId))
  }

  function handleDelete(accountId: string) {
    persist(removeMailAccount(accounts, accountId))
  }

  function handleEdit(accountId: string) {
    const account = accounts.find((item) => item.id === accountId)
    if (!account) return
    setModal({ open: true, mode: 'edit', account })
  }

  return (
    <>
      <section className="flex h-full min-h-0 flex-col" aria-label="Mail Hub">
        <p className="home-section-eyebrow">Mail Hub</p>
        <h2 className="mt-1 home-section-title">메일</h2>
        <p className="mt-0.5 text-xs font-normal text-slate-500">연결된 계정에서 바로 열기</p>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto scrollbar-slim">
          {accounts.length === 0 ? (
            <div className="rounded-btn border border-dashed border-line px-3 py-5 text-center">
              <p className="text-xs font-medium text-slate-600">등록된 메일 계정이 없습니다.</p>
            </div>
          ) : (
            <ul className="m-0 list-none divide-y divide-line p-0">
              {accounts.map((account) => (
                <MailAccountItem
                  key={account.id}
                  account={account}
                  onMarkRead={handleMarkRead}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={() => setModal({ open: true, mode: 'add' })}
          className="mt-3 inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-btn border border-line bg-canvas/40 px-3 py-2 text-xs font-medium text-slate-600 motion-subtle hover:bg-canvas"
        >
          <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
          메일 계정 추가
        </button>
      </section>

      <AddMailAccountModal
        key={
          modal.open
            ? modal.mode === 'edit'
              ? `edit-${modal.account.id}`
              : 'create-mail-account'
            : 'closed'
        }
        open={modal.open}
        mode={modal.open ? modal.mode : 'add'}
        account={modal.open && modal.mode === 'edit' ? modal.account : undefined}
        onClose={() => setModal({ open: false })}
        onSave={(account) => {
          if (modal.open && modal.mode === 'edit') {
            handleUpdateAccount(account)
          } else {
            handleAddAccount(account)
          }
        }}
      />
    </>
  )
}
