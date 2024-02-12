// helper to update state from actions
export default function updateAction(state: any, payload: any) {
  return {
    ...state,
    ...payload,
  };
}
