import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Database,
    Server,
    ShieldCheck,
    Globe,
    ArrowRight,
    Loader2
} from "lucide-react";

export default function ConnectScreen({ onConnectSubmit, onBack }) {
    const [form, setForm] = useState({
        host: "localhost",
        port: "3306",
        user: "root",
        password: "",
        db: "",
    });

    const [loading, setLoading] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        onConnectSubmit(form);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-full max-w-xl">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-6 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={onBack}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </Button>

                <Card className="border-border shadow-xl bg-card">
                    <CardHeader className="space-y-1 pb-6 border-b">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <Database className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">MySQL Database</Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Connect Your Database</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Provide your database credentials to initialize the SQL assistant session.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6 pt-6">
                            {/* Host & Port */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3 space-y-2">
                                    <Label htmlFor="host" className="flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5 text-muted-foreground" /> Hostname / IP
                                    </Label>
                                    <Input
                                        id="host"
                                        placeholder="localhost"
                                        value={form.host}
                                        onChange={e => setForm({ ...form, host: e.target.value })}
                                        required
                                        className="transition-all hover:border-primary/50 focus:border-primary"
                                    />
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="port">Port</Label>
                                    <Input
                                        id="port"
                                        placeholder="3306"
                                        value={form.port}
                                        onChange={e => setForm({ ...form, port: e.target.value })}
                                        required
                                        className="transition-all hover:border-primary/50 focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Authentication */}
                            <div className="space-y-4 pt-2 border-t border-dashed">
                                <div className="space-y-2">
                                    <Label htmlFor="user" className="flex items-center gap-2">
                                        <Server className="w-3.5 h-3.5 text-muted-foreground" /> Username
                                    </Label>
                                    <Input
                                        id="user"
                                        placeholder="root"
                                        value={form.user}
                                        onChange={e => setForm({ ...form, user: e.target.value })}
                                        required
                                        className="transition-all hover:border-primary/50 focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" /> Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="transition-all hover:border-primary/50 focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Database Name */}
                            <div className="space-y-2 pt-2 border-t border-dashed">
                                <Label htmlFor="db" className="flex items-center gap-2 text-primary font-semibold">
                                    Database Name
                                </Label>
                                <Input
                                    id="db"
                                    placeholder="e.g. ecommerce_db"
                                    value={form.db}
                                    onChange={e => setForm({ ...form, db: e.target.value })}
                                    required
                                    className="h-11 font-medium transition-all hover:border-primary/50 focus:border-primary"
                                />
                                <p className="text-[11px] text-muted-foreground italic">
                                    Note: Your credentials are encrypted and never stored in plain text.
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="pb-8 pt-2">
                            <Button className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px]" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Establishing Secure Connection...
                                    </>
                                ) : (
                                    <>
                                        Connect & Initialize Session <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
