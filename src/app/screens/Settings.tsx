import { Lock, Server, Brain, Sliders, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";

export function Settings() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure CodeSentinel preferences
        </p>
      </div>

      {/* Privacy & Security */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Privacy & Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-900">
                Offline Mode
              </Label>
              <p className="text-sm text-slate-500">
                Process all data locally without internet connection
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Enabled
              </Badge>
              <Switch defaultChecked disabled />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-900">
                No Cloud Data Transmission
              </Label>
              <p className="text-sm text-slate-500">
                Never send code or analysis data to external servers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Enabled
              </Badge>
              <Switch defaultChecked disabled />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-900">
                Encrypted Local Storage
              </Label>
              <p className="text-sm text-slate-500">
                Encrypt analysis results and cached data
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Docker Configuration */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Docker Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="docker-image" className="text-sm font-medium text-slate-900">
              Sandbox Image
            </Label>
            <Select defaultValue="node18">
              <SelectTrigger id="docker-image">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="node18">Node.js 18 (Alpine)</SelectItem>
                <SelectItem value="node20">Node.js 20 (Alpine)</SelectItem>
                <SelectItem value="python311">Python 3.11</SelectItem>
                <SelectItem value="java17">Java 17 (OpenJDK)</SelectItem>
                <SelectItem value="dotnet7">DotNet 7</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memory-limit" className="text-sm font-medium text-slate-900">
              Memory Limit (MB)
            </Label>
            <Input
              id="memory-limit"
              type="number"
              defaultValue="512"
              className="max-w-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout" className="text-sm font-medium text-slate-900">
              Execution Timeout (seconds)
            </Label>
            <Input
              id="timeout"
              type="number"
              defaultValue="30"
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Model Configuration */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">AI Model Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="llm-model" className="text-sm font-medium text-slate-900">
              Local LLM Model (Ollama)
            </Label>
            <Select defaultValue="codellama">
              <SelectTrigger id="llm-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="codellama">CodeLlama 13B</SelectItem>
                <SelectItem value="llama2">Llama 2 13B</SelectItem>
                <SelectItem value="mistral">Mistral 7B</SelectItem>
                <SelectItem value="phi2">Phi-2</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Selected model runs entirely on your machine
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-900">
                Enable AI Review
              </Label>
              <p className="text-sm text-slate-500">
                Use local AI for code analysis and suggestions
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-900">
                Auto-generate Summaries
              </Label>
              <p className="text-sm text-slate-500">
                Automatically create AI summaries after scans
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Analysis Configuration */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Analysis Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-900">
                Scan Depth
              </Label>
              <span className="text-sm text-slate-600">Deep</span>
            </div>
            <Slider defaultValue={[75]} max={100} step={25} />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Quick</span>
              <span>Standard</span>
              <span>Deep</span>
              <span>Comprehensive</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complexity-threshold" className="text-sm font-medium text-slate-900">
              Complexity Threshold
            </Label>
            <Input
              id="complexity-threshold"
              type="number"
              defaultValue="15"
              className="max-w-xs"
            />
            <p className="text-xs text-slate-500">
              Functions exceeding this complexity will be flagged
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-900">
                Include Test Files
              </Label>
              <p className="text-sm text-slate-500">
                Analyze test files in complexity calculations
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-900">
                Ignore node_modules
              </Label>
              <p className="text-sm text-slate-500">
                Exclude dependencies from analysis
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
