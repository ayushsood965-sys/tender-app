// Helper to convert Indian currency number to words
export const numberToIndianWords = (num) => {
    if (!num || isNaN(num)) return "";
    num = Math.floor(Number(num));
    if (num === 0) return "Zero Rupees Only";

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const formatSection = (n) => {
        let str = "";
        if (n >= 100) {
            str += a[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            str += b[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n > 0) {
            str += a[n] + " ";
        }
        return str;
    };

    let result = "";
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remainder = num;

    if (crore > 0) result += formatSection(crore) + "Crore ";
    if (lakh > 0) result += formatSection(lakh) + "Lakh ";
    if (thousand > 0) result += formatSection(thousand) + "Thousand ";
    if (remainder > 0) result += formatSection(remainder);

    return `Rupees ${result.trim()} Only`;
};
