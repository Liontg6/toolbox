export default function ipv6UintArrayToString(bytes: Uint8Array, compress: boolean): string {
    const groups = [];
    if (!compress) {
        for (let i = 0; i < 16; i += 2) {
            const group = (bytes[i] << 8) | bytes[i + 1];
            groups.push(group.toString(16).padStart(4, '0'));
        }
        return groups.join(':');
    } else {
        for (let i = 0; i < 16; i += 2) {
            const group = (bytes[i] << 8) | bytes[i + 1];
            let groupString = group.toString(16).padStart(4, '0')
            groupString = groupString.replace(/\b0+/g, '') || '0'
            groups.push(groupString);
        }
        let output = groups.join(":");

        // Search for occurrences of continuous '0' octets
        let zeros = [...output.matchAll(/\b:?(?:0+:?){2,}/g)];

        // See which is the longest one and replace it with '::'
        if (zeros.length > 0) {
            let max = '';
            zeros.forEach(item => {
                if (item[0].replaceAll(':', '').length > max.replaceAll(':', '').length) {
                    max = item[0];
                }
            })
            output = output.replace(max, '::');
        }
        return output;
    }
}
