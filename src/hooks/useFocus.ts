import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DefaultService } from "../api";
import { useGameStore } from "../stores/gameStore";
import { useNotification } from "./useNotification";
import { getErrorMessage } from "../utils/errors";
import { playerMoveLabel } from "../features/courses/treeLabels";

/**
 * "Practise only this line": the position every exercise starts from,
 * set from the course tree and shown/cleared on the Play screen.
 */
export function useFocus() {
  const queryClient = useQueryClient();
  const { notify } = useNotification();
  const resetGame = useGameStore((s) => s.resetGame);

  const query = useQuery({ queryKey: ["focus"], queryFn: () => DefaultService.getFocusApiFocusGet() });
  const focus = query.data?.fen && query.data.move ? { fen: query.data.fen, move: query.data.move } : null;
  const label = focus ? playerMoveLabel(focus.fen, focus.move) : null;

  const afterChange = () => {
    resetGame(); // the next Play screen visit loads a position from the new focus
    queryClient.invalidateQueries({ queryKey: ["focus"] });
  };

  const setFocus = useMutation({
    mutationFn: (fen: string) => DefaultService.setFocusApiFocusPut({ fen }),
    onSuccess: (data) => {
      afterChange();
      if (data.fen && data.move) notify(`Practising only ${playerMoveLabel(data.fen, data.move)} and its sub-lines.`, "success");
    },
    onError: (err: unknown) => notify(getErrorMessage(err, "Could not focus on that line."), "error"),
  });

  const clearFocus = useMutation({
    mutationFn: () => DefaultService.clearFocusApiFocusDelete(),
    onSuccess: () => {
      afterChange();
      notify("Practising all your enabled courses again.", "info");
    },
    onError: (err: unknown) => notify(getErrorMessage(err, "Could not clear the focus."), "error"),
  });

  return { focus, label, setFocus: setFocus.mutate, clearFocus: clearFocus.mutate, busy: setFocus.isPending || clearFocus.isPending };
}
