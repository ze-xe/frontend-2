export const tokenFormatter = (value: number, compact = false) => {
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: value,
        notation: compact ? 'compact' : 'standard'
    })
    return formatter
}

export const dollarFormatter = (value: number, compact = false) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: compact ? 'compact' : 'standard'
    })
}