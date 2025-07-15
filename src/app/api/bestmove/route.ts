type MoveRequest = {
  engine: string;
  position: string;
  depth?: number;
};

type MoveResponse = {
  best_move: string;
  from: string;
  to: string;
  promotion?: string;
  log: [];
};

export async function POST(request: Request) {
  const data: MoveRequest = await request.json();

  try {
    const res = await fetch("https://ebcd62bb7e1d.ngrok-free.app/bestmove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errMsg = "Failed to fetch best move";
      try {
        const err = await res.json();
        errMsg = err.detail || errMsg;
      } catch {
        // response body is not JSON
      }
      return new Response(JSON.stringify({ error: errMsg }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bestMove: MoveResponse = await res.json();

    return new Response(JSON.stringify(bestMove), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
