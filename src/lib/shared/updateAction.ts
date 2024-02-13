// helper to update state from actions
export default function updateStateFromAction(state: any, payload: any) {
  return {
    ...state,
    ...payload,
  };
}
