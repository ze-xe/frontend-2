export const tokenFormatter = (value: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: value,
    })
    return formatter
}

export const dollarFormatter = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    })
}