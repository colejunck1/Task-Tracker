import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
    const [hulls, setHulls] = useState([]);

    useEffect(() => {
        fetchHulls();
    }, []);

    async function fetchHulls() {
        const { data, error } = await supabase.from("production_schedule").select("hull_number, slot_number, scheduled_date");
        if (error) console.log("Error fetching hulls:", error);
        else setHulls(data);
    }

    return (
        <div>
            <h1>Production Schedule</h1>
            <ul>
                {hulls.map((hull) => (
                    <li key={hull.hull_number}>
                        Slot {hull.slot_number}: Hull {hull.hull_number} - {new Date(hull.scheduled_date).toDateString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
