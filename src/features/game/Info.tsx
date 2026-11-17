import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close, ExpandMore, OpenInFull } from "@mui/icons-material";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

interface InfoProps {
  mode: string;
  feedback?: string;
  /** Kept for callers; the panel always fills the space its parent gives it. */
  width?: string;
  link: string | null;
  onExplanation: () => void;
  animationKey?: number;
}

const MODE_LABEL: Record<string, string> = {
  show: "Not quite: play the shown move",
  repeat: "Now repeat it",
  play: "Explanation",
};

/**
 * Feedback/explanation panel under (or beside) the board.
 *
 * The text fills whatever height the panel gets and fades out when it does not
 * fit; the expand button then opens the full text in a dialog (full screen on
 * phones) whose Close button is always visible. Nothing here can make the page
 * itself scroll.
 */
export function Info({ mode, link, onExplanation, animationKey = 0 }: InfoProps) {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textBoxRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setVisible(false);
    setExpanded(false);
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [animationKey, mode, link]);

  const checkOverflow = useCallback(() => {
    const el = textBoxRef.current;
    if (el) setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useLayoutEffect(() => {
    checkOverflow();
    const el = textBoxRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", checkOverflow);
      return () => window.removeEventListener("resize", checkOverflow);
    }
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [checkOverflow, link, visible]);

  const borderColor = mode === "show" ? "error.main" : mode === "repeat" ? "warning.main" : "success.main";
  const isUrl = typeof link === "string" && link.startsWith("http");

  const content = isUrl ? (
    <Link href={link as string} target="_blank" rel="noopener noreferrer">
      View in Chessable
    </Link>
  ) : (
    <span>{link}</span>
  );

  const fade = "linear-gradient(to bottom, #000 calc(100% - 2.5em), transparent)";

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        gap: 1,
        p: 1,
        bgcolor: "background.paper",
        border: visible ? 5 : 0,
        borderColor,
        borderRadius: 1,
        transition: "border 0.2s ease-in-out",
        overflow: "hidden",
      }}
    >
      <Box
        ref={textBoxRef}
        data-testid="info-text"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          cursor: isOverflowing ? "pointer" : "default",
          maskImage: isOverflowing ? fade : "none",
          WebkitMaskImage: isOverflowing ? fade : "none",
        }}
        onClick={isOverflowing ? () => setExpanded(true) : undefined}
      >
        <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.45, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
          {content}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", flexShrink: 0, gap: 0.5 }}>
        {isOverflowing && (
          <IconButton aria-label="Show full explanation" size="small" onClick={() => setExpanded(true)}>
            <ExpandMore fontSize="small" />
          </IconButton>
        )}
        <Button aria-label="Explore position" onClick={onExplanation} sx={{ minWidth: 32, height: 32, p: 0.5 }} size="small">
          <OpenInFull fontSize="small" />
        </Button>
      </Box>

      <Dialog
        open={expanded}
        onClose={() => setExpanded(false)}
        fullScreen={fullScreenDialog}
        scroll="paper"
        maxWidth="md"
        fullWidth
        // Mode stripe as an inset shadow: a border would add height and make the
        // full-screen dialog taller than the phone screen.
        PaperProps={{
          sx: (t) => ({
            boxShadow: `inset 0 6px 0 ${
              mode === "show" ? t.palette.error.main : mode === "repeat" ? t.palette.warning.main : t.palette.success.main
            }`,
          }),
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          {MODE_LABEL[mode] ?? MODE_LABEL.play}
          <IconButton
            aria-label="Close explanation"
            onClick={() => setExpanded(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ fontSize: "1rem", lineHeight: 1.55, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
            {content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpanded(false)} variant="contained">
            Back to the board
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
