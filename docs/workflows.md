# Workflow Utama

## Asatidz

`PENDING_PROFILE → PENDING_REVIEW → APPROVED`

Cabang keputusan:

- `PENDING_REVIEW → REVISION_REQUIRED → PENDING_REVIEW`
- `PENDING_REVIEW → REJECTED`
- `APPROVED → SUSPENDED → APPROVED`

Semua keputusan admin memiliki alasan dan audit log.

## Materi

`DRAFT → SUBMITTED → IN_REVIEW → APPROVED → PUBLISHED`

Cabang:

- `IN_REVIEW → REVISION_REQUIRED → SUBMITTED`
- `IN_REVIEW → REJECTED`
- `PUBLISHED → ARCHIVED`

Hanya admin yang dapat mengubah status menjadi `PUBLISHED`.

## Donasi

`PENDING_VERIFICATION → APPROVED | REJECTED`

Transaksi approved tidak diedit. Koreksi dilakukan melalui reversal atau adjustment yang tercatat.

## Payout

`DRAFT → PENDING → PAID`

Cabang: `PENDING → FAILED` atau `DRAFT/PENDING → CANCELLED`.
