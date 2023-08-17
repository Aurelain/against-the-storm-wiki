/**
 *
 */
const formatBonus = (value) => {
    const text = value.toString();
    if (text.includes('.')) {
        let percent = value * 100;
        const close = Math.round(percent);
        if (Math.abs(close - percent) < 0.01) {
            percent = close;
        }
        const sign = percent > 0 ? '+' : '-';
        return sign + Math.abs(percent) + '%';
    } else {
        const sign = value > 0 ? '+' : '-';
        return sign + Math.abs(value);
    }
};

export default formatBonus;
