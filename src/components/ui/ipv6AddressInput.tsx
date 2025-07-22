import * as React from "react";
import { cn } from "@/lib/utils";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./context-menu";

interface Ipv6AddressInputProps {
  valueIp?: string;
  valueCidr?: number;
  onChange?: (ip: string, cidr: number) => void;
  className?: string;
}

const Ipv6AddressInput = React.forwardRef<HTMLDivElement, Ipv6AddressInputProps>(
  ({ valueIp = "", valueCidr = "", onChange, className, ...props }, ref) => {
    const [ipParts, setIpParts] = React.useState(["", "", "", "", "", "", "", ""]);
    const [cidr, setCidr] = React.useState(valueCidr || "0");
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([null, null, null, null]);
    const cidrRef = React.useRef<HTMLInputElement | null>(null);
    const [isPastingAllowed, setIsPastingAllowed] = React.useState(true);

    React.useEffect(() => {
      const parts = valueIp.split("/");
      const ip = parts[0].split(":");
      if (ip.length === 8) {
        setIpParts(ip);
      }
      if (parts.length > 1) {
        setCidr(parts[1]);
      } else {
        setCidr("0");
      }
    }, [valueIp]);

    const handleIpPartChange = (index: number, value: string) => {
      if (isNaN(+value) || +value < 0) {
        return;
      }

      const newIpParts = [...ipParts];
      newIpParts[index] = Math.min(+value, 255).toString();
      setIpParts(newIpParts);
      const ip = newIpParts.join(":");
      onChange?.(ip, +cidr);
    };

    const handleCidrChange = (value: string) => {
      const cidrValue = parseInt(value);
      if (isNaN(cidrValue) || cidrValue < 0) {
        setCidr("");
        const ip = ipParts.join(":");
        onChange?.(ip, +cidr);
      } else {
        const clampedCidr = Math.min(cidrValue, 128);
        setCidr(clampedCidr.toString());
        const ip = ipParts.join(":");
        onChange?.(ip, clampedCidr);
      }
    };

    const handlePasteEvent = (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const pastedData = event.clipboardData.getData("text");
      handlePaste(pastedData);
    };

    const handlePaste = (pastedData: string) => {
      const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/(\d{1,2}))?/;
      const match = ipRegex.exec(pastedData);
      if (match) {
        setIpParts([match[1], match[2], match[3], match[4]]);
        if (match[6]) {
          setCidr(match[6]);
          onChange?.(`${match[1]}.${match[2]}.${match[3]}.${match[4]}/${match[6]}`, +cidr);
        } else {
          setCidr("");
          onChange?.(`${match[1]}.${match[2]}.${match[3]}.${match[4]}`, +cidr);
        }
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key === "Backspace" && event.currentTarget.value === "0" && index > 0 && index < 8) {
        event.preventDefault();
        if (inputRefs.current[index - 1]) {
          (inputRefs.current[index - 1] as HTMLInputElement).focus();
        }
      } else if (event.key === "Backspace" && event.currentTarget.value === "" && index == 8) {
        event.preventDefault();
        if (inputRefs.current[7]) {
          inputRefs.current[7].focus();
        }
      }
      console.info(event.key, event.currentTarget.value, index, event.currentTarget.selectionStart, event.currentTarget.selectionEnd);
      // Handle moving to the next input when the current input is full
      if (!isNaN(+event.key) && +(event.currentTarget.value + "" + event.key) > 255 && index < 7 && event.currentTarget.selectionStart === event.currentTarget.selectionEnd) {
        event.preventDefault();
        if (inputRefs.current[index + 1]) {
          (inputRefs.current[index + 1] as HTMLInputElement).focus();
          const newIpParts = [...ipParts];
          newIpParts[index + 1] = event.key;
          setIpParts(newIpParts);
        }
      }
      // Handle moving to the CIDR input when the last part is full
      if (!isNaN(+event.key) && +(event.currentTarget.value + "" + event.key) > 255 && index === 7 && event.currentTarget.selectionStart === event.currentTarget.selectionEnd) {
        event.preventDefault();
        if (cidrRef.current) {
          cidrRef.current.focus();
          setCidr(event.key);
        }
      }
    };

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={ref}
            className={cn(
              "flex items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
              className
            )}
            onPaste={handlePasteEvent}
            {...props}
          >
            {
              [0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="px-1">:</span>}
                  <input
                    type="text"
                    value={ipParts[index]}
                    onChange={(e) => handleIpPartChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    className="w-12 text-center bg-transparent focus:outline-none focus:ring-0 focus:border-input"
                  />
                </React.Fragment>
              ))
            }
            <span className="px-1">/</span>
            <input
              type="text"
              value={cidr}
              onChange={(e) => handleCidrChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 8)}
              ref={cidrRef}
              className="w-8 text-center bg-transparent focus:outline-none focus:ring-0 focus:border-input"
              maxLength={3}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {
            // TODO: Make this a generic component and use a global context
          }
          <ContextMenuItem onClick={() => {
            navigator.clipboard.writeText(`${ipParts.join(":")}/${cidr}`);
          }}>Copy {`${ipParts.join(":")}/${cidr}`}</ContextMenuItem>
          <ContextMenuItem
            disabled={!isPastingAllowed}
            onClick={() => {
              navigator.clipboard.readText().then((text) => {
                handlePaste(text);
              }).catch((err) => {
                console.error("Failed to read clipboard contents: ", err);
                setIsPastingAllowed(false);
              });
            }}>{
              isPastingAllowed ? "Paste" : "Paste - Reading your clipboard not allowed by your browser. Use a key combination."
            }</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }
);

Ipv6AddressInput.displayName = "Ipv6AddressInput";

export { Ipv6AddressInput };