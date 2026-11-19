import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Tree, { RawNodeDatum } from "react-d3-tree";
import { Chessboard } from "react-chessboard";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DefaultService } from "../../api";
import type { CourseTreeResponse, TreeNode } from "../../api";
import { playerMoveLabel, replyLabel, strengthColor, strengthLabel } from "./treeLabels";

interface TreeExplorerProps {
  courseId: number;
  onExit: () => void;
}

/**
 * Plies shown per view; deeper lines are opened with the › button on a node.
 * Two on phones, so the tree fits at a readable size instead of shrinking.
 */
const viewDepth = () => (typeof window !== "undefined" && window.innerWidth < 600 ? 2 : 3);
const NODE_W = 150;
const NODE_H = 46;
const GAP_X = 70; // horizontal room for the connector lines
const GAP_Y = 18;

interface NodeData extends RawNodeDatum {
  attributes: {
    fen: string;
    move: string; // player's move, numbered
    reply: string; // opponent move that led here, numbered ("" for a root)
    probability: number; // -1 when unknown
    comment: string;
    canOpen: boolean;
  };
  children?: NodeData[];
}

interface Crumb {
  fen: string | null; // null = course start
  label: string;
}

function toNode(node: TreeNode, reply: string, isViewRoot: boolean): NodeData {
  const children = node.opponent_responses.map((r) => toNode(r.child, replyLabel(r.child.fen, r.move), false));
  return {
    name: node.fen,
    attributes: {
      fen: node.fen,
      move: playerMoveLabel(node.fen, node.correct_move),
      reply,
      probability: node.success_probability ?? -1,
      comment: node.comment ?? "",
      // Opening is useful when the line continues past this view, or to re-centre on a deeper node.
      canOpen: !isViewRoot && (Boolean(node.has_more) || children.length > 0),
    },
    children: children.length ? children : undefined,
  };
}

function toTree(data: CourseTreeResponse): NodeData | null {
  if (data.roots.length === 0) return null;
  if (data.roots.length === 1) return toNode(data.roots[0], "", true);
  return {
    name: "start",
    attributes: { fen: "", move: "Start", reply: "", probability: -1, comment: "", canOpen: false },
    children: data.roots.map((r) => toNode(r, "", false)),
  };
}

function shape(node: NodeData): { depth: number; leaves: number } {
  if (!node.children?.length) return { depth: 1, leaves: 1 };
  const kids = node.children.map(shape);
  return { depth: 1 + Math.max(...kids.map((k) => k.depth)), leaves: kids.reduce((a, k) => a + k.leaves, 0) };
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

const TreeExplorer: React.FC<TreeExplorerProps> = ({ courseId, onExit }) => {
  const theme = useTheme();
  const [path, setPath] = useState<Crumb[]>([{ fen: null, label: "Course start" }]);
  const viewFen = path[path.length - 1].fen;
  const [depth] = useState(viewDepth);
  const [selected, setSelected] = useState<{ fen: string; comment: string } | null>(null);
  const [treeBox, treeSize] = useElementSize<HTMLDivElement>();
  const [sideBox, sideSize] = useElementSize<HTMLDivElement>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["courseTree", courseId, viewFen, depth],
    queryFn: () => DefaultService.getCourseTreeApiCoursesCourseIdTreeGet(courseId, null, depth, viewFen),
    meta: { errorToast: false },
  });

  const tree = useMemo(() => (data ? toTree(data) : null), [data]);
  const playerColor = data?.player_color === "black" ? "black" : "white";

  useEffect(() => {
    if (tree) setSelected({ fen: tree.attributes.fen || tree.children?.[0]?.attributes.fen || "", comment: tree.attributes.comment });
  }, [tree]);

  const openLine = useCallback((node: NodeData) => {
    setPath((p) => [...p, { fen: node.attributes.fen, label: node.attributes.move }]);
  }, []);

  // Fit the whole view into the panel (shrink only), root at the left, centred vertically.
  const { zoom, translate } = useMemo(() => {
    if (!tree || !treeSize.width) return { zoom: 1, translate: { x: 0, y: 0 } };
    const { depth, leaves } = shape(tree);
    const contentW = depth * (NODE_W + GAP_X);
    const contentH = leaves * (NODE_H + GAP_Y);
    const z = Math.max(0.35, Math.min(1, (treeSize.width - 24) / contentW, (treeSize.height - 24) / contentH));
    return { zoom: z, translate: { x: 12 + (NODE_W / 2) * z, y: treeSize.height / 2 } };
  }, [tree, treeSize.width, treeSize.height]);

  const c = {
    card: theme.palette.background.paper,
    text: theme.palette.text.primary,
    muted: theme.palette.text.secondary,
    border: theme.palette.divider,
    selected: theme.palette.primary.main,
  };

  const renderNode = ({ nodeDatum }: { nodeDatum: RawNodeDatum }) => {
    const node = nodeDatum as NodeData;
    const a = node.attributes;
    const prob = a.probability < 0 ? null : a.probability;
    const isSelected = selected?.fen === a.fen && a.fen !== "";
    const select = () => a.fen && setSelected({ fen: a.fen, comment: a.comment });
    return (
      <g>
        <g onClick={select} style={{ cursor: a.fen ? "pointer" : "default" }}>
          <title>{a.comment ? `${a.move}: ${a.comment.slice(0, 200)}` : a.move}</title>
          <rect
            x={-NODE_W / 2}
            y={-NODE_H / 2}
            width={NODE_W}
            height={NODE_H}
            rx={8}
            fill={c.card}
            stroke={isSelected ? c.selected : c.border}
            strokeWidth={isSelected ? 2.5 : 1}
          />
          {/* strength bar */}
          <rect x={-NODE_W / 2} y={-NODE_H / 2} width={6} height={NODE_H} rx={3} fill={strengthColor(prob)} stroke="none" />
          {a.reply ? (
            <>
              <text x={-NODE_W / 2 + 14} y={-4} fill={c.muted} stroke="none" fontSize={12}>
                {a.reply}
              </text>
              <text x={-NODE_W / 2 + 14} y={14} fill={c.text} stroke="none" fontSize={15} fontWeight={700}>
                {a.move}
              </text>
            </>
          ) : (
            <text x={-NODE_W / 2 + 14} y={5} fill={c.text} stroke="none" fontSize={15} fontWeight={700}>
              {a.move}
            </text>
          )}
          <text x={NODE_W / 2 - (a.canOpen ? 30 : 10)} y={5} textAnchor="end" fill={strengthColor(prob)} stroke="none" fontSize={12} fontWeight={600}>
            {strengthLabel(prob)}
          </text>
        </g>
        {a.canOpen && (
          <g onClick={() => openLine(node)} style={{ cursor: "pointer" }} transform={`translate(${NODE_W / 2 - 14}, 0)`}>
            <title>Open this line</title>
            <circle r={11} fill={c.selected} stroke="none" />
            <path d="M -3 -5 L 3 0 L -3 5" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

  // Side panel has 16px padding each side; keep a little extra room for a scrollbar.
  const boardSize = Math.max(160, Math.min(360, (sideSize.width || 0) - 48));

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.5, minWidth: 0 }}>
        <Tooltip title="Back to courses">
          <IconButton onClick={onExit} size="small" aria-label="Back to courses">
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Breadcrumbs maxItems={5} sx={{ minWidth: 0, overflow: "hidden" }} aria-label="Line">
          {path.map((crumb, i) =>
            i === path.length - 1 ? (
              <Typography key={i} color="text.primary" sx={{ fontWeight: 600 }}>
                {crumb.label}
              </Typography>
            ) : (
              <Link key={i} component="button" underline="hover" onClick={() => setPath((p) => p.slice(0, i + 1))}>
                {crumb.label}
              </Link>
            ),
          )}
        </Breadcrumbs>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        <Box
          ref={treeBox}
          sx={{
            flex: 1,
            minHeight: { xs: 260, md: 0 },
            minWidth: 0,
            position: "relative",
            borderTop: 1,
            borderRight: { md: 1 },
            borderColor: "divider",
            bgcolor: "background.default",
            overflow: "hidden",
          }}
        >
          {isLoading && (
            <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <CircularProgress />
            </Box>
          )}
          {isError && (
            <Typography color="error" sx={{ p: 2 }}>
              Could not load this line. Check your connection and try again.
            </Typography>
          )}
          {!isLoading && !isError && !tree && (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              This course has no positions yet.
            </Typography>
          )}
          {tree && treeSize.width > 0 && (
            <Tree
              key={`${viewFen ?? "start"}-${treeSize.width}x${treeSize.height}`}
              data={tree}
              orientation="horizontal"
              pathFunc="step"
              translate={translate}
              zoom={zoom}
              scaleExtent={{ min: 0.25, max: 1.5 }}
              nodeSize={{ x: NODE_W + GAP_X, y: NODE_H + GAP_Y }}
              separation={{ siblings: 1, nonSiblings: 1.15 }}
              collapsible={false}
              renderCustomNodeElement={renderNode}
              zoomable
              draggable
            />
          )}
        </Box>

        <Box
          ref={sideBox}
          sx={{
            width: { xs: "100%", md: 380 },
            boxSizing: "border-box",
            flexShrink: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            overflowY: "auto",
          }}
        >
          {selected?.fen ? (
            <>
              <Box sx={{ width: boardSize }}>
                <Chessboard position={selected.fen} boardWidth={boardSize} boardOrientation={playerColor} arePiecesDraggable={false} />
              </Box>
              {selected.comment && (
                <Paper variant="outlined" sx={{ p: 1.5, width: boardSize, boxSizing: "border-box" }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>
                    {selected.comment}
                  </Typography>
                </Paper>
              )}
            </>
          ) : (
            <Typography color="text.secondary">Click a move to see the position.</Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
            Bar colour shows how well you know the move (red weak, green strong, grey new). Use › to open a line.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TreeExplorer;
