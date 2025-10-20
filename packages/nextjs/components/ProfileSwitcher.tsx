import { Button } from "~~/components/ui/button";
import { Card, CardContent } from "~~/components/ui/card";
import { useAppStore, UserProfile } from "~~/store/useAppStore";
import { Briefcase, ShoppingCart } from "lucide-react";

export const ProfileSwitcher = () => {
  const { userProfile, setUserProfile } = useAppStore();

  return (
    <Card className="mb-6 border-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-mono text-base mb-1 uppercase tracking-wide">Active Profile</h3>
            <p className="text-sm font-sans font-light text-muted-foreground">
              {userProfile === 'seller'
                ? 'Create invoices, fractionalize, and borrow against them'
                : 'Buy invoice fractions and earn returns'}
            </p>
          </div>

          <div className="flex gap-3 p-1 bg-muted/30 rounded-[2px] border border-secondary/30">
            <Button
              variant={userProfile === 'seller' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setUserProfile('seller')}
              className="gap-2"
            >
              <Briefcase className="w-3 h-3" />
              Seller
            </Button>
            <Button
              variant={userProfile === 'buyer' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setUserProfile('buyer')}
              className="gap-2"
            >
              <ShoppingCart className="w-3 h-3" />
              Buyer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
