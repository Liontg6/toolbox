"use client";

import { NextIntlClientProvider, useMessages } from "next-intl";

/**
 * Handles client side internationalization with error handling.
 */
export default function IntlErrorHandlingProvider(
    { children, locale }: { children: React.ReactNode; locale: string },
) {
    const messages = useMessages();

    return (
        <NextIntlClientProvider
            locale={locale}
            onError={(error) => console.warn(error)}
            getMessageFallback={({ namespace, key }) => {
                const path = [namespace, key].filter((part) => part != null)
                    .join(".");

                console.warn(
                    `Missing translation for "${path}" in locale "${locale}".`,
                );

                return messages[key] ?? `[${key}]`;
            }}
            messages={messages}
        >
            {children}
        </NextIntlClientProvider>
    );
}
