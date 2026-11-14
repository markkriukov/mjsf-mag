export const EDITABLE_FIELDS = ['title', 'price', 'stock', 'description']

export function pickEditableFields(product) {
  return {
    title: product.title,
    price: product.price,
    stock: product.stock,
    description: product.description,
  }
}

export function toDraft(values) {
  return {
    title: values?.title ?? '',
    price: values?.price == null ? '' : String(values.price),
    stock: values?.stock == null ? '' : String(values.stock),
    description: values?.description ?? '',
  }
}

function parseNumber(value) {
  const text = String(value ?? '').trim().replace(',', '.')
  return text === '' ? Number.NaN : Number(text)
}

export function normalizeDraft(draft) {
  return {
    title: String(draft.title ?? '').trim(),
    price: parseNumber(draft.price),
    stock: parseNumber(draft.stock),
    description: String(draft.description ?? '').trim(),
  }
}

export function validateDraft(normalized) {
  const errors = {}

  if (normalized.title.length < 1 || normalized.title.length > 120)
    errors.title = 'Назва має містити від 1 до 120 символів'

  if (!Number.isFinite(normalized.price) || normalized.price <= 0)
    errors.price = 'Ціна має бути додатним числом'

  if (!Number.isInteger(normalized.stock) || normalized.stock < 0)
    errors.stock = 'Залишок має бути цілим числом від 0'

  if (normalized.description.length < 1 || normalized.description.length > 2000)
    errors.description = 'Опис має містити від 1 до 2000 символів'

  return errors
}
