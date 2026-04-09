/**
 * LEADERBOARD LOGIC
 * Handles CSV parsing and provides derived data computation.
 */
class LeaderboardManager {
    constructor(store) {
        this.store = store;
        this.csvUrl = '/results/leaderboard.csv';
    }

    async fetchAll() {
        try {
            const response = await fetch(this.csvUrl);
            if (!response.ok) throw new Error("CSV not found");
            
            const text = await response.text();
            const data = this.parseCSV(text);
            this.store.dispatch({ type: 'SET_LEADERBOARD', payload: data });
        } catch (err) {
            console.error("Leaderboard error:", err);
            this.store.dispatch({ 
                type: 'ADD_NOTIFICATION', 
                payload: { message: "Failed to load leaderboard.", type: "error" } 
            });
        }
    }

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const entry = {};
            headers.forEach((header, i) => {
                const val = values[i]?.trim();
                // Convert numbers, default missing to 0
                entry[header] = isNaN(val) ? val : parseFloat(val || 0);
            });
            return entry;
        }).filter(row => row.model); // Filter invalid rows
    }

    /**
     * DERIVED STATE: Sorting & Filtering
     * Must be computed during render, not stored.
     */
    getProcessedData(state, sortBy = 'overall_score') {
        let data = [...state.leaderboardData];

        // Sort logic
        data.sort((a, b) => {
            if (typeof a[sortBy] === 'string') return a[sortBy].localeCompare(b[sortBy]);
            return b[sortBy] - a[sortBy]; // Default descending for scores
        });

        return data;
    }

    /**
     * DERIVED STATE: Philosophy Highlighting
     * Checks if model meets philosophy requirements
     */
    checkPhilosophyMatch(model, selectedPhilosophies) {
        if (!model) return true;
        
        // Check every selected philosophy statement
        return selectedPhilosophies.every(p => {
            if (p.category === 'Practical') {
                return (model.code_quality + model.feature_complete) >= 8;
            }
            if (p.category === 'Philosophical') {
                return model.architecture >= 8;
            }
            if (p.category === 'Technical') {
                return model.best_practices >= 8;
            }
            return true;
        });
    }
}
