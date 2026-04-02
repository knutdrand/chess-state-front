import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Tree, { RawNodeDatum } from "react-d3-tree";
import { Chessboard } from "react-chessboard";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { apiUrl } from "../config";
import { CourseTree, TreeNode } from "../types/courseTree";

interface TreeExplorerProps {
  courseId: number;
  token: string;
  onExit: () => void;
}

interface D3TreeNode extends RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: D3TreeNode[];
}

function getNodeColor(prob: number): string {
  const hue = prob * 120; // 0 = red, 120 = green
  return `hsl(${hue}, 70%, 45%)`;
}

function transformNode(node: TreeNode): D3TreeNode {
  const children: D3TreeNode[] = node.opponent_responses.map((resp) => {
    const childD3 = transformNode(resp.child);
    return {
      ...childD3,
      // Prefix the child's name with the opponent response move
      name: `${resp.move} > ${childD3.name}`,
      attributes: {
        ...childD3.attributes,
        opponentMove: resp.move,
        weight: resp.weight,
      },
    };
  });

  return {
    name: node.correct_move,
    attributes: {
      probability: Math.round(node.success_probability * 100) / 100,
      fen: node.fen,
      ...(node.comment ? { comment: node.comment } : {}),
    },
    children: children.length > 0 ? children : undefined,
  };
}

function transformTree(tree: CourseTree): D3TreeNode {
  if (tree.roots.length === 1) {
    return transformNode(tree.roots[0]);
  }

  // Multiple roots: create a virtual root
  return {
    name: "Start",
    attributes: { probability: 0, fen: "" },
    children: tree.roots.map(transformNode),
  };
}

// Custom node renderer
const renderCustomNode = ({
  nodeDatum,
  onNodeClick,
}: {
  nodeDatum: D3TreeNode;
  onNodeClick: (node: D3TreeNode) => void;
}) => {
  const prob = Number(nodeDatum.attributes?.probability ?? 0.5);
  const color = getNodeColor(prob);
  // Extract just the player move (strip opponent move prefix if present)
  const parts = nodeDatum.name.split(" > ");
  const playerMove = parts[parts.length - 1];
  const opponentMove = parts.length > 1 ? parts[0] : null;

  return (
    <g onClick={() => onNodeClick(nodeDatum)} style={{ cursor: "pointer" }}>
      {/* Opponent move label above the node */}
      {opponentMove && (
        <text
          fill="#888"
          fontSize="11"
          textAnchor="middle"
          dy="-22"
          fontStyle="italic"
        >
          {opponentMove}
        </text>
      )}
      {/* Node circle */}
      <circle r={15} fill={color} stroke="#333" strokeWidth={1.5} />
      {/* Player move label */}
      <text fill="white" fontSize="10" textAnchor="middle" dy="4" fontWeight="bold">
        {playerMove}
      </text>
      {/* Probability below */}
      <text fill="#555" fontSize="9" textAnchor="middle" dy="30">
        {Math.round(prob * 100)}%
      </text>
    </g>
  );
};

const TreeExplorer: React.FC<TreeExplorerProps> = ({
  courseId,
  token,
  onExit,
}) => {
  const [treeData, setTreeData] = useState<CourseTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFen, setSelectedFen] = useState<string | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await axios.get<CourseTree>(
          `${apiUrl}/courses/${courseId}/tree`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTreeData(response.data);
        setPlayerColor(response.data.player_color || "white");
        // Select the first root's fen by default
        if (response.data.roots.length > 0) {
          setSelectedFen(response.data.roots[0].fen);
          setSelectedComment(response.data.roots[0].comment);
        }
      } catch (err) {
        setError("Failed to load course tree");
        console.error("Error fetching tree:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [courseId, token]);

  const handleNodeClick = useCallback((node: D3TreeNode) => {
    const fen = node.attributes?.fen;
    if (fen && typeof fen === "string" && fen.length > 0) {
      setSelectedFen(fen);
      setSelectedComment(
        node.attributes?.comment ? String(node.attributes.comment) : null
      );
    }
  }, []);

  const d3Tree = useMemo(() => {
    if (!treeData) return null;
    return transformTree(treeData);
  }, [treeData]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !d3Tree) {
    return (
      <Box sx={{ p: 2 }}>
        <IconButton onClick={onExit} sx={{ mb: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography color="error">{error || "No tree data"}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100%",
        width: "100%",
      }}
    >
      {/* Tree panel */}
      <Box
        sx={{
          flex: 1,
          minHeight: { xs: 300, md: "auto" },
          position: "relative",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}>
          <IconButton onClick={onExit} size="small">
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Tree
          data={d3Tree}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 200, y: 50 }}
          nodeSize={{ x: 100, y: 80 }}
          separation={{ siblings: 1.2, nonSiblings: 1.5 }}
          renderCustomNodeElement={(rd3tProps) =>
            renderCustomNode({
              nodeDatum: rd3tProps.nodeDatum as D3TreeNode,
              onNodeClick: handleNodeClick,
            })
          }
          zoomable
          draggable
        />
      </Box>

      {/* Board + comment panel */}
      <Box
        sx={{
          width: { xs: "100%", md: 360 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          gap: 2,
        }}
      >
        {selectedFen ? (
          <>
            <Box sx={{ width: "100%", maxWidth: 340 }}>
              <Chessboard
                position={selectedFen}
                boardWidth={340}
                boardOrientation={playerColor}
                arePiecesDraggable={false}
              />
            </Box>
            {selectedComment && (
              <Paper sx={{ p: 2, width: "100%", maxWidth: 340 }}>
                <Typography variant="body2">{selectedComment}</Typography>
              </Paper>
            )}
          </>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 4 }}>
            Click a node to view its position
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TreeExplorer;
