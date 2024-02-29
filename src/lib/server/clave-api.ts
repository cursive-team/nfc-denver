export async function createClaveAccessCode() {
  return await fetch("https://api.getclave.io/api/v1/waitlist/codes/single", {
    method: "POST",
    headers: {
      "x-api-key": process.env.CLAVE_API_KEY!,
      "Content-Type": "application/json",
    },
  }).then(async (r) => {
    if (!r.ok) {
      console.log(r.status);
      console.log(await r.text());
      throw new Error("Request Clave access code failed");
    }

    const result = await r.json();
    return result as { code: string };
  });
}
